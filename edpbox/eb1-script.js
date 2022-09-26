>D

hour=0
clk=""
old=""
wfc=""
wfp=0
cnt=0
wtd=0
hh=0
mm=0
ss=0
tariff=0
ttext=""
m:p:ipwrm=0 6
m:p:ipwrh=0 60
m:p:epwrm=0 6
m:p:epwrh=0 60
ipwr=0
epwr=0
strh=""
m:p:lpid=0 24
m:p:lpih=0 4
m:p:lped=0 24
m:p:lpeh=0 4
lpi=0
lpe=0
lpmm=0
strd=""

>B

=>Delay 100
=>Delay 100
=>Delay 100

tper=25
smlj=0

=>Delay 100
=>SerialLog 0
=>WifiConfig
=>WifiPower

=>Delay 100
=>Sensor53 r

>E

wfc=WifiConfig#?
wfp=WifiPower

>T

tariff=?#Tariff

switch tariff
case 1
ttext="Vazio"
case 2
ttext="Ponta"
case 3
ttext="Cheias"
ends

; charts

ipwr=?#Power
epwr=?#APE
lpmm=?#LP1_MM
lpi=?#LP3_IMP
lpe=?#LP6_EXP

if upsecs%tper==0
and cnt>30
then
ipwrm=ipwr
epwrm=epwr
endif

if chg[lpmm]>0
and cnt>30
then
lpih=lpi
lpeh=lpe
print Array: lpih lpeh
endif

>S

hh=sml[1]
mm=sml[2]
ss=sml[3]

if cnt==30
then
smlj=1
tper=10
=>UfsRun discovery1.txt
=>Delay 100
=>UfsRun discovery2.txt
endif

if cnt<99
then
cnt+=1
endif

; charts

if chg[mm]>0
and cnt>30
then
;
ipwrh=ipwrm[-2]
print Array: ipwrh
;
epwrh=epwrm[-2]
print Array: epwrh
;
strh="cnt"+s(mm)
print Saving Vars
svars
endif

hour=int(time/60)

if chg[hour]>0
and cnt>30
then
strd="cnt"+s(hh)
lpid=lpih[0]+lpih[1]+lpih[2]+lpih[3]
lped=lpeh[0]+lpeh[1]+lpeh[2]+lpeh[3]
print Array: lpid lped
endif

; janz wtd

clk=s(2.0mm)+s(2.0ss)

if cnt==99
then
wtd+=1
endif

if wtd==1
then
old=clk
endif

if wtd==90
then
wtd=0
if old==clk
then
print modbus error !!!
; 
=>Restart -3
; 
endif
endif

; janz wtd eof

>W

@<b>NTP </b> %tstamp%
@<b>Vars </b> cnt=%0cnt% tper=%0tper% smlj=%0smlj% hour=%0hour%
@<b>Vars </b> wtd=%0wtd% clk=%0clk% old=%0old%
@<b>Vars </b> ipwr=%0ipwr% epwr=%0epwr% lpmm=%0lpmm% lpi=%0lpi% lpe=%0lpe%
@<b>Wifi </b> %wfc% <b> Power </b> %0wfp% <b> Topic </b> %topic%
@<br>
<br>
Tarifa {m} %ttext%
<br>

; charts

$<div id="chart1" style="width:300px;height:200px;padding:0px;text-align:center"></div><br><br>
$gc(lt2 ipwrh epwrh "wr" "Power Import" "Power Export" strh)
$var options = {
$chartArea:{left:40,width:'80%%'},
$width:'300px',
$legend:'none',
$title:'Power Import & Export 1h [W]',
$};
$gc(e)

$<div id="chart2" style="width:300px;height:200px;padding:0px;text-align:center"></div><br><br>
$gc(lt2 lpid lped "wr" "Import Inc" "Export Inc" strd)
$var options = {
$chartArea:{left:40,width:'80%%'},
$width:'300px',
$legend:'none',
$title:'Energy Import & Export 24h [Wh]',
$};
$gc(e)

; EB1 monofasico

>M 1

+1,3,mN1,1,9600,EB1,1,10,r010400010001,r0104006C0002,r010400160002,r010400260003,r010400790003,r0104007F0002,r0104000B0002,r01440301

; r01440601 Imp+Exp
; r01440301 Imp

; 01

1,01040Cxxxxxxxxxxuu@i0:1,Clock ,h,CH,0
1,01040Cxxxxxxxxxxxxuu@i0:1,Clock ,m,CM,0
1,01040Cxxxxxxxxxxxxxxuu@i0:1,Clock ,s,CS,0

1,=h<br>

; 6C

1,010404UUuu@i1:10,Voltage L1 ,V,Voltage,1
1,010404xxxxUUuu@i1:10,Current L1 ,A,Current,1

1,=h<br>

; 16

1,010408UUuuUUuu@i2:1000,Total Energy Import ,kWh,TEI,2
1,010408xxxxxxxxUUuuUUuu@i2:1000,Total Energy Export ,kWh,TEE,2

1,=h<br>

; 26

1,01040CUUuuUUuu@i3:1000,Total Energy T1 Vazio ,kWh,TET1,2
1,01040CxxxxxxxxUUuuUUuu@i3:1000,Total Energy T2 Ponta ,kWh,TET2,2
1,01040CxxxxxxxxxxxxxxxxUUuuUUuu@i3:1000,Total Energy T3 Cheias ,kWh,TET3,2

1,=h<br>

; 79

1,01040aUUuuUUuu@i4:1,Active Power Import ,W,Power,0
1,01040axxxxxxxxUUuuUUuu@i4:1,Active Power Export ,W,Active Power Export,0
1,01040axxxxxxxxxxxxxxxxUUuu@i4:1000,Power Factor ,φ,Factor,3

; 7F

1,01040aUUuu@i5:10,Frequency ,Hz,Frequency,1

; 0B

1,010406uu@i6:1,Tariff ,,Tariff,0

; load profile

1,=h<br>Load Profile (15min)<br>
1,=h<br>

; 01441d Imp+Exp
; 014411 Imp

1,014411UUuu@i7:1,Year,,LP1_Y,0
1,014411xxxxuu@i7:1,Month,,LP1_M,0
1,014411xxxxxxuu@i7:1,Day,,LP1_D,0
1,014411xxxxxxxxxxuu@i7:1,Hour,h,LP1_HH,0
1,014411xxxxxxxxxxxxuu@i7:1,Minute,m,LP1_MM,0
; summer
; amr
1,014411xxxxxxxxxxxxxxxxxxxxxxxxxxUUuuUUuu@i7:1,Import Inc,Wh,LP3_IMP,0
1,01441dxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxUUuuUUuu@i7:1,+Ri Inc,VArh,LP4,0
1,01441dxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxUUuuUUuu@i7:1,-Rc Inc,VArh,LP5,0
1,01441dxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxUUuuUUuu@i7:1,Export Inc,Wh,LP6_EXP,0

; eof lp
; eof meter
#
; eof script
; check code 17:59

